Package.describe({
    name: 'pwix:collection-behaviours',
    version: '2.1.0-rc',
    summary: 'Define and attach behaviours to collections',
    git: 'https://github.com/trychlos/pwix-collection-behaviours'
});

Package.onUse( function( api ){
    api.versionsFrom([ '2.9.0', '3.0-rc.0' ]);

    api.use([
        'check',
        'coffeescript@2.7.0',
        'mongo'
    ]);

    api.addFiles([
        'lib/behaviours.coffee',
        'lib/mongo.coffee'
    ]);

    api.export( 'CollectionBehaviours' );
});
