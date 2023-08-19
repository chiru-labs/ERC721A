import bigInt from 'big-integer';
import curves from './curves.json';
import Curve from './curve';

export default function getCurveByName (name) {
  const curve = curves[name];

  if (!curve) {
    return null;
  }

  const p = bigInt(curve.p, 16);
  const a = bigInt(curve.a, 16);
  const b = bigInt(curve.b, 16);
  const n = bigInt(curve.n, 16);
  const h = bigInt(curve.h, 16);
  const Gx = bigInt(curve.Gx, 16);
  const Gy = bigInt(curve.Gy, 16);

  return new Curve(p, a, b, Gx, Gy, n, h);
}
