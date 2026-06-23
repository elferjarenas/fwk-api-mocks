#!/usr/bin/env node
/**
 * Script para actualizar tests de /testing/* a /yape/*
 * Convierte:
 * - /testing/populate → /yape/populate (con YAML)
 * - /testing/personality → /yape/ChangeUserPersonality (con text/plain formato "idc,personality")
 * - /testing/data → /yape/data
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '..');
const testFiles = [
  'mibanco/quote.e2e-spec.ts',
  'mibanco/register.e2e-spec.ts',
  'mibanco/offer.e2e-spec.ts',
  'mibanco/simulate.e2e-spec.ts',
  'cards/cards-detail.e2e-spec.ts',
  'cards/cards-list.e2e-spec.ts',
  'atlas/transfer.e2e-spec.ts',
  'ciam/oauth.e2e-spec.ts',
  'ciam/biometry.e2e-spec.ts',
];

function updateTestFile(filePath) {
  const fullPath = path.join(testDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 1. Agregar imports si no existen
  if (!content.includes('toYamlString') && !content.includes('formatPersonalityChange')) {
    const importMatch = content.match(/import.*from\s+['"].*TEST_CONFIG['"]/);
    if (importMatch) {
      const importLine = importMatch[0];
      const newImport = `${importLine}\nimport { toYamlString, formatPersonalityChange } from '../helpers/yape-endpoints.helper';`;
      content = content.replace(importLine, newImport);
      modified = true;
    }
  }

  // 2. Reemplazar DELETE /testing/data
  if (content.includes("delete('/testing/data')")) {
    content = content.replace(/\.delete\(['"]\/testing\/data['"]\)/g, ".delete('/yape/data')");
    modified = true;
  }

  // 3. Reemplazar POST /testing/populate
  // Necesitamos extraer el IDC del primer usuario para usarlo después
  const populateRegex = /\.post\(['"]\/testing\/populate['"]\)\s*\.send\(\[([\s\S]*?)\]\);/g;
  let populateMatch;
  let userIdc = null;

  while ((populateMatch = populateRegex.exec(content)) !== null) {
    const userData = populateMatch[1];
    
    // Extraer clientCode/idc del primer usuario
    const clientCodeMatch = userData.match(/clientCode:\s*(\d+)/);
    const idcMatch = userData.match(/idc:\s*['"]?(\d+)['"]?/);
    
    if (clientCodeMatch) {
      userIdc = clientCodeMatch[1];
    } else if (idcMatch) {
      userIdc = idcMatch[1];
    }

    // Agregar campo idc si no existe
    let updatedUserData = userData;
    if (!idcMatch && clientCodeMatch) {
      updatedUserData = userData.replace(/(clientCode:\s*\d+)/, `$1,\n      idc: '${clientCodeMatch[1]}'`);
    }

    const replacement = `const yamlData = toYamlString([${updatedUserData}]);\n    await request(BASE_URL)\n      .post('/yape/populate')\n      .set('Content-Type', 'application/yaml')\n      .send(yamlData);`;
    
    content = content.replace(populateMatch[0], replacement);
    modified = true;
  }

  // 4. Agregar constante USER_IDC si se encontró
  if (userIdc && !content.includes('USER_IDC')) {
    const describeMatch = content.match(/(describe\([^{]+\{\s*const\s+BASE_URL[^;]+;)/);
    if (describeMatch) {
      content = content.replace(describeMatch[1], `${describeMatch[1]}\n  const USER_IDC = '${userIdc}';`);
      modified = true;
    }
  }

  // 5. Reemplazar PUT /testing/personality
  const personalityRegex = /\.put\(['"]\/testing\/personality['"]\)\s*\.send\(\{\s*email:\s*[^,]+,\s*personality:\s*['"]([^'"]+)['"]\s*\}\);/g;
  content = content.replace(personalityRegex, (match, personality) => {
    return `.post('/yape/ChangeUserPersonality')\n        .set('Content-Type', 'text/plain')\n        .send(formatPersonalityChange(USER_IDC, '${personality}'));`;
  });
  
  if (content !== fs.readFileSync(fullPath, 'utf8')) {
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Actualizado: ${filePath}`);
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
  }
}

console.log('🔄 Actualizando archivos de tests...\n');
testFiles.forEach(updateTestFile);
console.log('\n✨ Proceso completado!');
