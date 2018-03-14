livefyre('''
deploy:
  branch: "^(rc|staging|production)$"
  image:
    label: corpjenkins/node
  git: true
  commands:
    - make clean dist
  lfcdn:
    maxAge:
      rc: 100
      staging: 600
  appService: {}
''')
