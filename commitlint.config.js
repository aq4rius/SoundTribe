module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'web',
        'server',
        'prisma',
        'auth',
        'events',
        'artists',
        'chat',
        'notifications',
        'onboarding',
        'deps',
      ],
    ],
    'scope-empty': [1, 'never'], // warn if no scope
  },
};
