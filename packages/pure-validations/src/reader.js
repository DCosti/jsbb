import { Monad} from './typeClasses'

Reader['fantasy-land/of'] = x => Reader(_ => x); // Monad, Applicative
Reader.ask = () => Reader((...props) => props); // Reader

const proto = {
  'fantasy-land/chain': function(f) { return Reader((...props) => f(this.runReader(...props)).runReader(...props)) }, // Monad, Chain
  'fantasy-land/contramap': function(f) { return Reader((...props) => this.runReader(...f(...props))) }, // Contravariant
  ...Monad.derive(Reader)
}

function Reader(computation) {
  return Object.assign(
    Object.create(proto), {
    runReader: computation // Reader
  });
}


// function Reader(computation) {
//   const self = { runReader: computation } // Reader

//   self.chain = f => Reader((...props) => f(self.runReader(...props)).runReader(...props)); // Monad, Chain
//   self.contramap = f => Reader((...props) => self.runReader(...f(...props))); // Contravariant

//   deriveMonad(self, Reader)

//   return self
// }

// function deriveMonad(self, typeRep) {
//   self.map = f => self.chain(x => Reader.of(f(x))); // Functor
//   self.ap = other => self.chain(fn => other.map(fn)); // Applicative, Apply
// }


export { Reader };
