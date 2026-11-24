# Original content and provenance

[Deutsch](THIRD_PARTY.md) · **English**

Hover!, its original graphics, sounds and game code originate from Microsoft and the respective rights holders involved. The existing MIT license in this repository **does not grant a new license to this third-party content**. Original copyright and license notices are retained; libraries such as jQuery and Three.js include their own notices.

Primary preservation sources:

- https://web.archive.org/web/20131002142942/http://hover.ie
- https://web.archive.org/web/20190311054501/http://hover.ie:80/
- https://archive.org/details/HoverWinRT
- https://archive.org/details/hover_202508

An Archive.org uploader's classification is not adopted as a new license for the original game. This is an independent preservation project, not an official Microsoft website.

All logos and fonts used on the homepage come from the preserved game assets. Game screenshots were captured during local testing of the restored releases.

## Importer: Three.js r160

The isolated importer uses Three.js r160 with OBJLoader, MTLLoader, GLTFLoader, FBXLoader, TGALoader, DDSLoader, NURBS helpers and BufferGeometryUtils under the MIT license. Source: https://github.com/mrdoob/three.js/tree/r160. License: `modifications/vendor/three/LICENSE`. Only module import paths were adjusted to local files. The archived game engine remains unchanged.

FBX additionally uses fflate 0.6.9 (MIT): https://github.com/101arrowz/fflate/tree/v0.6.9. Full license: `modifications/vendor/three/fflate.LICENSE`.

[New craft/map assets and their provenance](NEW-ASSETS.en.md).
