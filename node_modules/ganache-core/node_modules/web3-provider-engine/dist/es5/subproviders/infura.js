'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var createInfuraProvider = require('eth-json-rpc-infura/src/createProvider');
var ProviderSubprovider = require('./provider.js');

var InfuraSubprovider = function (_ProviderSubprovider) {
  _inherits(InfuraSubprovider, _ProviderSubprovider);

  function InfuraSubprovider() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, InfuraSubprovider);

    var provider = createInfuraProvider(opts);
    return _possibleConstructorReturn(this, (InfuraSubprovider.__proto__ || Object.getPrototypeOf(InfuraSubprovider)).call(this, provider));
  }

  return InfuraSubprovider;
}(ProviderSubprovider);

module.exports = InfuraSubprovider;