## [2.0.7](https://github.com/wessberg/compatfactory/compare/v2.0.6...v2.0.7) (2023-01-09)


### Bug Fixes

* implement compat handling for createTypeParameterDeclaration with or without modifiers as first argument ([d87f910](https://github.com/wessberg/compatfactory/commit/d87f910223e2a45e730b8a2b58f25b61ea464ce9))



## [2.0.6](https://github.com/wessberg/compatfactory/compare/v2.0.5...v2.0.6) (2023-01-09)


### Bug Fixes

* fix issues with overloads ([acc70eb](https://github.com/wessberg/compatfactory/commit/acc70eb4bc894b88f72c87093992962a29d69574))



## [2.0.5](https://github.com/wessberg/compatfactory/compare/v2.0.4...v2.0.5) (2023-01-09)


### Bug Fixes

* add missing overloaded signatures ([95a6eee](https://github.com/wessberg/compatfactory/commit/95a6eee5fc0fe21b8541cc96eae63919a5fb0372))



## [2.0.4](https://github.com/wessberg/compatfactory/compare/v2.0.3...v2.0.4) (2023-01-09)


### Bug Fixes

* fix issue with overloaded arguments ([45a7456](https://github.com/wessberg/compatfactory/commit/45a7456f2c455ce2f8dffee66632bb8a23e3dca6))



## [2.0.3](https://github.com/wessberg/compatfactory/compare/v2.0.2...v2.0.3) (2023-01-09)


### Bug Fixes

* fix issue with constructing ClassStaticDeclarations ([4370bfd](https://github.com/wessberg/compatfactory/commit/4370bfdae6ed1588dd452a60dd3d0710da7638cd))



## [2.0.2](https://github.com/wessberg/compatfactory/compare/v2.0.1...v2.0.2) (2023-01-09)


### Bug Fixes

* correctly split decorators and modifiers ([5cb9b93](https://github.com/wessberg/compatfactory/commit/5cb9b9301b050f85a4d8a604cf2ecf353d01f35c))



## [2.0.1](https://github.com/wessberg/compatfactory/compare/v2.0.0...v2.0.1) (2023-01-09)


### Bug Fixes

* resolve issues with import declarations ([6efb703](https://github.com/wessberg/compatfactory/commit/6efb703bd2aff6e8e8fc1c297afcff825ae64a83))



# [2.0.0](https://github.com/wessberg/compatfactory/compare/v1.0.1...v2.0.0) (2023-01-09)


### Bug Fixes

* fix lint ([3408a0d](https://github.com/wessberg/compatfactory/commit/3408a0dd93719ade333f08fb83926b151c0103a3))


### Features

* add support for TypeScript v4.8 ([05020b8](https://github.com/wessberg/compatfactory/commit/05020b85fd72dc5c305463bf68804fde26a0d74a))
* add support for TypeScript v4.9 ([4d157b3](https://github.com/wessberg/compatfactory/commit/4d157b31f29048ebbb81724eda414c1298f6aebe))



## [1.0.1](https://github.com/wessberg/compatfactory/compare/v1.0.0...v1.0.1) (2022-05-30)


### Features

* add support for passing in 5 arguments to creatImportTypeNode on all versions of TypeScript ([9ae49d6](https://github.com/wessberg/compatfactory/commit/9ae49d6c11cfd2093c8de3bb8878f75ed07b92ca))



# [1.0.0](https://github.com/wessberg/compatfactory/compare/v0.0.13...v1.0.0) (2022-05-29)



## [0.0.13](https://github.com/wessberg/compatfactory/compare/v0.0.12...v0.0.13) (2022-04-12)



## [0.0.12](https://github.com/wessberg/compatfactory/compare/v0.0.11...v0.0.12) (2021-11-17)


### Bug Fixes

* ensure that createExportSpecifier can be called with three arguments across all TypeScript versions ([aad253d](https://github.com/wessberg/compatfactory/commit/aad253ddd5a2d7442a792a66d9e4d7353cabb96a))



## [0.0.11](https://github.com/wessberg/compatfactory/compare/v0.0.10...v0.0.11) (2021-11-17)


### Bug Fixes

* ensure that createImportSpecifier can be called with three arguments across all TypeScript versions ([cd840b0](https://github.com/wessberg/compatfactory/commit/cd840b093f9f2d01eda3bd7cf766a1d443dcb2d5))



## [0.0.10](https://github.com/wessberg/compatfactory/compare/v0.0.9...v0.0.10) (2021-11-17)


### Features

* add TypeScript v4.5 support ([2d33062](https://github.com/wessberg/compatfactory/commit/2d33062a4a840644aae884b258d4a8e0ffa38a43))



## [0.0.9](https://github.com/wessberg/compatfactory/compare/v0.0.8...v0.0.9) (2021-08-30)


### Features

* add support for TypeScript v4.4 and add more compatibility fixes ([285ae96](https://github.com/wessberg/compatfactory/commit/285ae96bd83c1420fe7ff1b8130ab72eaf7370f8))



## [0.0.8](https://github.com/wessberg/compatfactory/compare/v0.0.7...v0.0.8) (2021-06-11)


### Features

* **property-access-chain:** add compatibility for TypeScript < 3.6 when generating PropertyAccessChains ([909ab22](https://github.com/wessberg/compatfactory/commit/909ab22084c9070b1bb974c281c5c7b9a0548a76))



## [0.0.7](https://github.com/wessberg/compatfactory/compare/v0.0.6...v0.0.7) (2021-05-29)


### Bug Fixes

* use provided modifiers when creating/updating MethodSignatures ([cfac75f](https://github.com/wessberg/compatfactory/commit/cfac75fcd593384d5d3b1c1a4066f5f769f50eaf))



## [0.0.6](https://github.com/wessberg/compatfactory/compare/v0.0.5...v0.0.6) (2021-05-29)


### Bug Fixes

* allow passing an already wrapped TypeScript object to ensureNodeFactory without performing any additional wrapping ([913abb8](https://github.com/wessberg/compatfactory/commit/913abb8f7e7218876013a5f3cf48dd3f748f404e))



## [0.0.5](https://github.com/wessberg/compatfactory/compare/v0.0.4...v0.0.5) (2021-05-29)


### Bug Fixes

* fix signature for createVariableDeclaration ([a311bc1](https://github.com/wessberg/compatfactory/commit/a311bc17ca73c8d899f160afed606f6ef49d3fa5))



## [0.0.4](https://github.com/wessberg/compatfactory/compare/v0.0.3...v0.0.4) (2021-05-28)


### Features

* add additional JSDoc factory functions for older TypeScript versions ([99ced96](https://github.com/wessberg/compatfactory/commit/99ced9601698114282b4a57c1d3afec6fc51c960))



## [0.0.3](https://github.com/wessberg/compatfactory/compare/v0.0.2...v0.0.3) (2021-05-28)


### Features

* unify signatures for createImportEqualsDeclaration and createMappedTypeNode with latest TypeScript versions for TypeScript <4 ([ed7e4e0](https://github.com/wessberg/compatfactory/commit/ed7e4e07e11749f487ad7663e6a5e662f34f9c8f))



## [0.0.2](https://github.com/wessberg/compatfactory/compare/v0.0.1...v0.0.2) (2021-05-28)


### Features

* unify signatures for createImportEqualsDeclaration and createMappedTypeNode with latest TypeScript versions for v4.0 and v4.1 ([a4e3f5f](https://github.com/wessberg/compatfactory/commit/a4e3f5f9b04108f0c1d188ed6a3d5eff689aff09))



## 0.0.1 (2021-05-28)



