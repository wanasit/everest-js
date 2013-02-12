# Evernode

This is an extension to the great work done by wadey on [node-thrift](https://github.com/wadey/node-thrift/).
This is kinda messy right now, but it will get better. The extension allows users to use the Evernote(TM) Thrift API
by implementing HTTPS connections over Thrift. Wadey's code has been copied in here temporarily for functional purposes,
but we by no means take credit for his work. Once we get a pull request in, this code base will hopefully morph into more of an
Evernote(TM) wrapper. Please be nice and submit issues when seen as this is a v0.0.1 release.

## Currently In Use

This was released by the [Reno Collective](http://www.renocollective.com/) team (aka FlyingNinjaSquirrel) that created [Colorstache](http://www.colorstache.com/) (currently a finalist in the
Evernote Developer Competition). It is currently in use. If you like our app, please [vote for us](http://www.evernote.com/about/etc/colorstache.php) in the
competition (apologies for the shameless self promotion).

## Thrift Compiler

I have included the thrift files for the Evernote(TM) 1.19 SDK, so if you feel overly ambitious (or a new version is released), you can export
the thrift API code manually using the following commands:

    thrift --gen js:node -r -strict UserStore.thrift
    thrift --gen js:node -r -strict NoteStore.thrift

## Some manual tweaking (Just an FYI)

While I did copy the generated node.js thrift files from the Evernote(TM) 1.19 SDK, I had to make some changes to some of the regular expression
definitions in Limits_types.js that were generated. Some of the regular expressions had single quotes in them and were also wrapped in single quotes.
Changing them to be wrapped in double quotes fixed it.

I also had to add an include in NoteStore_types.js and UserStore_types.js to require './Types_types'.

## Examples

Examples of using the Evernote(TM) API can be found in the [examples](https://github.com/cloudsnap/evernode/tree/master/examples) folder.
