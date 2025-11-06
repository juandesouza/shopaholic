/** @type {import('next').NextConfig} */
module.exports = function (phase, { defaultConfig }) {
  return {
    ...defaultConfig,
    generateBuildId: async () => {
      return null // Let Next.js use default
    },
  }
}
