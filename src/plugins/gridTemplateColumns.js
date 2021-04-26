import { asList } from '../../jit/pluginUtils'
import createUtilityPlugin from '../util/createUtilityPlugin'

export default function () {
  return createUtilityPlugin('gridTemplateColumns', [['grid-cols', ['gridTemplateColumns']]], {
    resolveArbitraryValue: asList,
  })
}
