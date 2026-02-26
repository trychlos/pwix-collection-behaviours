/*
 * pwix:collection-behaviours/src/common/js/behaviours.js
 */

import { check, Match } from 'meteor/check';

let definedBehaviours = {};

let messages = {
    attachAborted( name, collectionName ){
        return 'attach() refused, behaviour \''+name+'\' already attached to \''+collectionName+'\' collection (hint: use \'{replace: true}\' to override)';
    },
    attachFailed( name ){
        return 'attach() failed, behaviour \''+name+'\' not found. Do you have defined it (hint: CollectionBehaviours.define()) ?';
    },
    behaviourDefined( name ){
        return 'behaviour \''+name+'\' already defined, use \'{replace: true}\' to override';
    },
    behaviourNotFound( name ){
        return 'configure() failed behaviour \''+name+'\' not found';
    }
};

// a way to share the below function between 'mongo' and 'behaviours' modules
CollectionBehaviours._share = {};

// inside of _attach() this is a collection
CollectionBehaviours._share._attach = function( behaviours, options ){
    check( behaviours, Match.OneOf( Function, [Match.OneOf( Function, String )], Object, String ));

    //# 'this' is a Mongo.Collection
    //#console.debug "pwix:collection-behaviours attach()ing '"+behaviours+"' behaviour on '"+this._name+"' collection with", options, "options"
    let name;
    let behaviourObject;

    options = options || {};

    if( Match.test( behaviours, String )){
        name = behaviours.toLowerCase();
        behaviourObject = definedBehaviours[name];

        if( !behaviourObject ){
            console.warn( messages.attachFailed( name ));
            return;
        }

        behaviourObject.collections = behaviourObject.collections || [];

        if( behaviourObject.collections.includes( this._name ) && !options?.replace ){
            console.warn( messages.attachAborted( name, this._name ));
            return;
        }

        behaviours = behaviourObject.behaviour;
    }

    if( Match.test( behaviours, Function )){
        let context = {
            collection: this,
            options: behaviourObject?.options || {}
        };

        behaviours.apply( context, [ options ] );

        behaviourObject = behaviourObject || {};
        behaviourObject.collections = behaviourObject.collections || [];
        behaviourObject.collections.push( this._name );

        return;
    }

    if( Match.test( behaviours, [Match.OneOf( Function, String )] )){
        let context = {
            collection: this
        };

        for( const behaviour of behaviours ){
            if( Match.test( behaviour, String )){
                name = behaviour.toLowerCase();
                behaviourObject = definedBehaviours[name];

                if( !behaviourObject ){
                    console.warn( messages.attachFailed( name ));
                    continue;
                }

                behaviourObject.collections = behaviourObject.collections || [];

                if( behaviourObject.collections.includes( this._name )){
                    console.warn( messages.attachAborted( name, this._name ));
                    continue;
                }

                behaviour = behaviourObject.behaviour;
                context.options = behaviourObject.options;
            }

            if( Match.test( behaviour, Function )){
                context.options = context.options || {};

                behaviour.call( context, {} );

                behaviourObject = behaviourObject || {};
                behaviourObject.collections = behaviourObject.collections || [];
                behaviourObject.collections.push( this._name );
            }
        }
        return;
    }

    if( Match.test( behaviours, Object )){
        for( const { name, options } of behaviours ){
            check( name, String );

            name = name.toLowerCase();

            behaviourObject = definedBehaviours[name];

            if( !behaviourObject ){
                console.warn( messages.attachFailed( name ));
                continue;
            }

            behaviourObject.collections = behaviourObject.collections || [];

            if( behaviourObject.collections.includes( this._name )){
                console.warn( messages.attachAborted( name, this._name ));
                continue;
            }

            let behaviour = behaviourObject.behaviour

            context = {
                collection: this,
                options: behaviourObject.options || {}
            };

            if( Match.test( behaviour, Function )){
                behaviour.call( context, options );
                behaviourObject.collections.push( this._name );
            } else {
                console.warn( messages.attachFailed( name ));
            }
        }
        return;
    }

    console.error( 'Attach failed, unknown reason' );
};

/*
 * attach multiple behaviours to multiple collections
 */
CollectionBehaviours.attach = function( collections, ...args ){
    check( collections, Match.OneOf( Mongo.Collection, [Mongo.Collection] ));
    let objectOrString = Match.OneOf( Object, String );
    check( args[0], Match.OneOf( objectOrString, [objectOrString] ));

    if( Match.test( collections, Mongo.Collection )){
        collections = [collections];
    }
    if( Match.test( args[0], Match.OneOf( Array, Object ))){
        args = args.slice( 0, 1 );
    }
    for( const collection of collections ){
        CollectionBehaviours._share._attach.apply( collection, args );
    }
    return;
};

CollectionBehaviours.config = function(){
    this.configure.apply( this, arguments );
};

CollectionBehaviours.configure = function( nameOrObject, options ){
    check( nameOrObject, Match.OneOf( Object, String ));
    check( options, Match.Optional( Object ));

    if( Match.test( nameOrObject, String )){
        check( options, Object );
        let tmp = {};
        tmp[nameOrObject] = options;
        nameOrObject = tmp;
    }

    if( Match.test( nameOrObject, Object )){
        for( let { name, behaviourOptions } of nameOrObject ){
            name = name.toLowerCase();
            behaviourObject = definedBehaviours[name];

            if( behaviourObject ){
                behaviourObject.options = behaviourOptions;
            }
            else {
                console.warn( messages.behaviourNotFound( name ));
            }
        }
        return;
    }

    console.error( 'Configure failed, unknown reason' );
};

CollectionBehaviours.define = function( name, behaviour, options ){
    check( name, String );
    check( behaviour, Function );

    //optionsPattern = Match.ObjectIncluding
    //  replace: Boolean
    //check options, Match.Optional optionsPattern

    name = name.toLowerCase();

    behaviourObject = definedBehaviours[name];

    if( behaviourObject && !options?.replace ){
        console.warn( messages.behaviourDefined( name ));
    } else {
        definedBehaviours[name] = { behaviour: behaviour };
    }
};
