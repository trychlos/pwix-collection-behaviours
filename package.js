Package.describe({
    name: 'pwix:collection-behaviours',
    version: '2.2.0-rc.0',
    summary: 'Define and attach behaviours to collections',
    git: 'https://github.com/trychlos/pwix-collection-behaviours'
});

Package.onUse( function( api ){
    api.versionsFrom([ '2.9.0', '3.0-rc.0' ]);
    api.use([
        'check',
        //'coffeescript@2.7.0',
        'ecmascript',
        'mongo'
    ]);
    api.export([
        'CollectionBehaviours'
    ]);
    /*
    api.addFiles([
        'lib/behaviours.coffee',
        'lib/mongo.coffee'
     ]);
    */
    api.mainModule( 'src/client/js/index.js', 'client' );
    api.mainModule( 'src/server/js/index.js', 'server' );
});
