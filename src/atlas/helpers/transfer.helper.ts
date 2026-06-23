import { UserRepository } from '../../repository/user-repository.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { AtlasPersonalityCode } from '../constants/api-codes.js';
import { findExactPersonality } from '../../common/personality-checker.js';
import {
  buildSuccessfulTransferResponse,
  buildLynxFraudErrorResponse,
  buildInsufficientFundsErrorResponse,
} from '../messages/response.js';
import { TransferValidator, TransferRequestBody } from '../validators/transfer.validator.js';
import {
  createValidationException,
  createNotFoundException,
  createAtlasException,
} from '../exceptions/exception-builder.js';

/**
 * Format account number with dashes (e.g., 19370127333088 -> 193-70127333-0-88)
 */
function formatAccountNumberWithDashes(accountNumber: string): string {
  if (accountNumber.length !== 14) {
    return accountNumber; // Return as-is if not standard format
  }
  
  // Format: XXX-XXXXXXXX-X-XX
  return `${accountNumber.slice(0, 3)}-${accountNumber.slice(3, 11)}-${accountNumber.slice(11, 12)}-${accountNumber.slice(12, 14)}`;
}

/**
 * Generate random account transfer ID
 */
function generateAccountTransferId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}${random}`;
}

/**
 * Process account transfer request
 */
export function processAccountTransfer(body: Partial<TransferRequestBody>): {
  status: number;
  data: unknown;
} {
  // 1. Validate request
  const validator = new TransferValidator(body);
  if (!validator.valid()) {
    const error = validator.getFirstError();
    throw createValidationException(error?.message || 'Invalid request');
  }

  const validBody = body as TransferRequestBody;
  
  // Extract account numbers and amount
  const fromAccount = validBody.chargeMeanInformation!.chargeProduct!.referenceId!;
  const toAccount = validBody.depositMeanInformation!.depositProduct!.referenceId!;
  const amount = validBody.amount!;

  // 2. Find sender user and account
  const senderUser = UserRepository.findUserByAccountNumber(fromAccount);
  if (!senderUser) {
    throw createNotFoundException('SENDER_NOT_FOUND', `Sender account ${fromAccount} not found`);
  }

  const senderResult = UserRepository.findAccountInUser(senderUser, fromAccount);
  if (!senderResult) {
    throw createNotFoundException('SENDER_NOT_FOUND', `Sender account ${fromAccount} not found`);
  }

  // 3. Find receiver user and account
  const receiverUser = UserRepository.findUserByAccountNumber(toAccount);
  if (!receiverUser) {
    throw createNotFoundException('RECEIVER_NOT_FOUND', `Receiver account ${toAccount} not found`);
  }

  const receiverResult = UserRepository.findAccountInUser(receiverUser, toAccount);
  if (!receiverResult) {
    throw createNotFoundException('RECEIVER_NOT_FOUND', `Receiver account ${toAccount} not found`);
  }

  // 4. Get personalities from sender
  const personalities = senderUser.personalities || [];

  // 5. Validate sender has Atlas personality
  // If sender doesn't have any YPATLS* personality, return 404
  const hasAtlasPersonality = personalities.some((p: string) => p.startsWith('YPATLS'));
  if (!hasAtlasPersonality) {
    throw createNotFoundException(
      'SENDER_NOT_CONFIGURED',
      `Sender account ${fromAccount} is not configured for Atlas transfers`
    );
  }

  // 6. Check for Lynx fraud detection personality
  if (findExactPersonality(personalities, AtlasPersonalityCode.ATLAS_LYNX_FRAUD)) {
    const response = buildLynxFraudErrorResponse();
    throw createAtlasException(
      'Transaction denied by fraud detection',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      response
    );
  }

  // 7. Check balance and insufficient funds personality
  const senderBalance = parseFloat(senderResult.account.balance);
  const hasInsufficientPersonality = findExactPersonality(
    personalities,
    AtlasPersonalityCode.ATLAS_INSUFFICIENT_FUNDS
  );

  if (senderBalance < amount || hasInsufficientPersonality) {
    const response = buildInsufficientFundsErrorResponse();
    throw createAtlasException(
      'Insufficient funds for transfer',
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      response
    );
  }

  // 8. Success case - Update balances
  const newSenderBalance = senderBalance - amount;
  const newReceiverBalance = parseFloat(receiverResult.account.balance) + amount;

  // Update balances in repository
  UserRepository.updateAccountBalance(fromAccount, newSenderBalance);
  UserRepository.updateAccountBalance(toAccount, newReceiverBalance);

  // 9. Build success response
  const response = buildSuccessfulTransferResponse({
    accountTransferId: generateAccountTransferId(),
    senderAccountNumber: fromAccount,
    senderAccountNumberDashed: formatAccountNumberWithDashes(fromAccount),
    senderBalance: newSenderBalance,
    senderName: senderUser.name?.toUpperCase() || 'UNKNOWN',
    receiverAccountNumber: toAccount,
    receiverAccountNumberDashed: formatAccountNumberWithDashes(toAccount),
    receiverBalance: newReceiverBalance,
    receiverName: receiverUser.name?.toUpperCase() || 'UNKNOWN',
  });

  return {
    status: HttpStatusCodes.OK,
    data: response,
  };
}
