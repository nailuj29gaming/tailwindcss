import _ from 'lodash'
import flattenColorPalette from '../util/flattenColorPalette'
import toColorValue from '../util/toColorValue'
import { toRgba } from '../util/withAlphaVariable'
const { asValue, nameClass } = require('../../jit/pluginUtils')

function transparentTo(value) {
  if (typeof value === 'function') {
    return value({ opacityValue: 0 })
  }

  try {
    const [r, g, b] = toRgba(value)
    return `rgba(${r}, ${g}, ${b}, 0)`
  } catch (_error) {
    return `rgba(255, 255, 255, 0)`
  }
}

export default function () {
  return function ({ config, matchUtilities, addUtilities, theme, variants }) {
    let colorPalette = flattenColorPalette(theme('gradientColorStops'))

    if (config('mode') === 'jit') {
      matchUtilities({
        from: (modifier) => {
          let value = asValue(modifier, colorPalette)

          if (value === undefined) {
            return []
          }

          let transparentToValue = transparentTo(value)

          return {
            [nameClass('from', modifier)]: {
              '--tw-gradient-from': toColorValue(value, 'from'),
              '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, ${transparentToValue})`,
            },
          }
        },
      })
      matchUtilities({
        via: (modifier) => {
          let value = asValue(modifier, colorPalette)

          if (value === undefined) {
            return []
          }

          let transparentToValue = transparentTo(value)

          return {
            [nameClass('via', modifier)]: {
              '--tw-gradient-stops': `var(--tw-gradient-from), ${toColorValue(
                value,
                'via'
              )}, var(--tw-gradient-to, ${transparentToValue})`,
            },
          }
        },
      })
      matchUtilities({
        to: (modifier) => {
          let value = asValue(modifier, colorPalette)

          if (value === undefined) {
            return []
          }

          return {
            [nameClass('to', modifier)]: {
              '--tw-gradient-to': toColorValue(value, 'to'),
            },
          }
        },
      })
    } else {
      const colors = colorPalette

      const utilities = _(colors)
        .map((value, modifier) => {
          const transparentTo = (() => {
            if (_.isFunction(value)) {
              return value({ opacityValue: 0 })
            }

            try {
              const [r, g, b] = toRgba(value)
              return `rgba(${r}, ${g}, ${b}, 0)`
            } catch (_error) {
              return `rgba(255, 255, 255, 0)`
            }
          })()

          return [
            [
              nameClass('from', modifier),
              {
                '--tw-gradient-from': toColorValue(value, 'from'),
                '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, ${transparentTo})`,
              },
            ],
            [
              nameClass('via', modifier),
              {
                '--tw-gradient-stops': `var(--tw-gradient-from), ${toColorValue(
                  value,
                  'via'
                )}, var(--tw-gradient-to, ${transparentTo})`,
              },
            ],
            [
              nameClass('to', modifier),
              {
                '--tw-gradient-to': toColorValue(value, 'to'),
              },
            ],
          ]
        })
        .unzip()
        .flatten()
        .fromPairs()
        .value()

      addUtilities(utilities, variants('gradientColorStops'))
    }
  }
}
