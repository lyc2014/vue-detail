import typescript from '@rollup/plugin-typescript'
export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/vue.development.js',
        format: 'umd',
        name: 'Vue'
    },
    plugins: [typescript()]
}