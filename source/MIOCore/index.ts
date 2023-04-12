/* es6 modules assumes no side effects, if we want side effects we need to import them this way 
Further reading: https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-imports-being-elided-in-my-emit
*/
import './MIOCoreArray'
import './MIOString'

export * from './MIOCore'
export * from './MIOCoreHTMLParser'
export * from './MIOCoreLexer'
export * from './MIOCoreString'