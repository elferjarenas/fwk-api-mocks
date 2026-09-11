import type { PersonalityCode } from '../common/personality-types.js';

export interface Account {
  number: string;
  currency: string;
  balance: string;
  type: string;
  subtype?: string;
  status: string;
  opening_date?: string;
  release_date?: string;
  classification?: string;
}

export interface Card {
  number: string;
  payer_number?: string;
  pin4: string;
  expiry_date: string;
  status: string;
  cvv: string;
  usage?: string;
  visa_card_token?: string;
  izipay_card_encrypted?: string;
  niubiz_card_encrypted?: string;
  electronic_commerce?: string;
  abroadUsageEnabled?: string;
  card_type_description?: string;
  testenv?: string;
  accounts?: Account[];
}

export interface TestCase {
  service: string;
  tags?: string;
  code?: string;
  template?: string;
}

export interface User {
  name?: string;
  description?: string;
  email: string;
  email_consist?: string;
  password?: string;
  documentNumber?: string;
  personality?: PersonalityCode | string;
  personalities?: string[];
  data_in_bcp?: boolean;
  card_usage?: string;
  idc?: string;
  cic?: string;
  plin_flag?: boolean;
  plin_qr?: string;
  plin_bank_name?: string;
  plin_entities?: string;
  cce_flag?: boolean;
  cce_cci?: string;
  cce_entities?: string;
  cod_internacional?: string;
  phone_number?: string;
  uuid?: string;
  platform?: string;
  version?: string;
  device_token?: string;
  device_type?: string;
  phone_model?: string;
  phone_manufacturer?: string;
  balance_query?: string;
  timeout_api?: string;
  allow_transaction?: string;
  id_tico_account?: string;
  loan_id?: string;
  loan_offer_installments?: string;
  loan_offer_cem?: string;
  score?: string;
  clientCode?: number;
  maxAmount?: number;
  minAmount?: number;
  days?: number[];
  cards?: Card[];
  test_cases?: TestCase[];
}

export interface Personality {
  email: string;
  personality: PersonalityCode | string;
}

export interface RepositoryState {
  users: User[];
  personalities: Personality[];
  timestamp: string;
}

export interface SeedResult {
  usersCreated: number;
  personalitiesSet: number;
  cardsCreated: number;
  accountsCreated: number;
  errors: string[];
}
