/*
 * pwix:collection-behaviours/src/common/js/mongo.js
 */

import { check, Match } from 'meteor/check';

/*
 * - this is a collection
 * - args:
 *   > behaviour name
 *   > behaviour options
 */
Mongo.Collection.prototype.attachBehaviour = function( ...args ){
    let objectOrString = Match.OneOf( Object, String );
    check( args[0], Match.OneOf( objectOrString, [objectOrString] ));

    if( Match.test( args[0], Match.OneOf( Array, Object ))){
        args = args.slice( 0, 1 );
    }

    CollectionBehaviours._share._attach.apply( this, args );
};
