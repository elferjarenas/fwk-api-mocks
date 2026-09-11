module.exports = {
  types: [
    { value: 'feat',     name: 'feat:     Nueva funcionalidad' },
    { value: 'fix',      name: 'fix:      Corrección de bug' },
    { value: 'docs',     name: 'docs:     Cambios en documentación' },
    { value: 'style',    name: 'style:    Cambios de formato (no afectan la lógica)' },
    { value: 'refactor', name: 'refactor: Refactorización de código' },
    { value: 'perf',     name: 'perf:     Mejora de rendimiento' },
    { value: 'test',     name: 'test:     Agregar o corregir tests' },
    { value: 'build',    name: 'build:    Cambios en build o dependencias' },
    { value: 'ci',       name: 'ci:       Cambios en CI/CD' },
    { value: 'chore',    name: 'chore:    Otros cambios (mantenimiento)' },
    { value: 'revert',   name: 'revert:   Revertir commit anterior' }
  ],

  scopes: [
    { name: 'ciam' },
    { name: 'tikabank' },
    { name: 'atlas' },
    { name: 'cards' },
    { name: 'common' },
    { name: 'tests' },
    { name: 'deps' },
    { name: 'config' }
  ],

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix', 'refactor', 'perf'],

  subjectLimit: 72,

  skipQuestions: ['body', 'breaking', 'footer'],
  
  messages: {
    type: '¿Qué tipo de cambio estás haciendo?',
    scope: '¿Cuál es el scope de este cambio? (opcional):',
    customScope: 'Especifica el scope personalizado:',
    subject: 'Escribe una descripción corta del cambio (lowercase):\\n',
    confirmCommit: '¿Confirmar este commit?'
  }
};

