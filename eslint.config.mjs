import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

/**
 * Flat ESLint config. Next 16 hat `next lint` entfernt; `eslint-config-next`
 * liefert die Regeln als fertiges Flat-Config-Array.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
      'supabase/**',
      // shadcn/ui: unverändert übernommene Komponenten, werden laut Projektregel
      // nicht angefasst und daher auch nicht gelintet.
      'src/components/ui/**',
    ],
  },
  ...nextCoreWebVitals,
]

export default eslintConfig
