import { Map, Set, merge, mergeWith } from "immutable";
import curry from "lodash.curry";

const typeSymbol = Symbol("_type");
const errorsSymbol = Symbol("_errors");
const emptySuccess = make(successType, {}, []);

const successType = 'Success';
const failureType = 'Failure';
const skippedType = 'Skipped';

function make(type, fields, errors) {
  return Map(fields).withMutations(map => {
    map.set(typeSymbol, type).set(errorsSymbol, Set(errors));
  });
}

function Success(fields = {}) {
  return Object.keys(fields).length === 0 ? emptySuccess : make(successType, fields, []);
}

function Failure(errors, fields = {}) {
  return make(failureType, fields, errors);
}

function Skipped(errors, fields = {}) {
  return make(skippedType, fields, errors);
}



function match(validation, { Success, Failure, Skipped }) {
  const { [typeSymbol]: type, [errorsSymbol]: errors, ...fields } = validation.toObject();
  switch(type){
    case successType:
      return Success(fields)
    case failureType:
      return Failure(errors.toArray(), fields)
    case skippedType:
        return Skipped(fields)

  }
}

function mergerAll(value1, value2, key) {
  function mergeTypes(type1, type2){
    
  }
  switch(key){
    case typeSymbol:

  }
  return key === isSuccessSymbol ? value1 && value2 : key === errorsSymbol ? merge(value1, value2) : mergeWith(mergerAll, value1, value2);
}

const all = curry(function all(validation1, validation2) {
  return mergeWith(mergerAll, validation1, validation2);
})

function mergerAny(value1, value2, key) {
  return key === isSuccessSymbol || key === errorsSymbol ? undefined : any(value1, value2);
}

const any = curry(function any(validation1, validation2) {
  let result = mergeWith(mergerAny, validation1, validation2);

  const errors1 = _getErrors(validation1);
  const errors2 = _getErrors(validation2);

  const isSelfSuccess = _isEmpty(errors1) || _isEmpty(errors2);
  const isMergedFieldSuccess = result.reduce((acc, val) => acc && val ? _isSuccess(val) : true, true);

  result = result.set(isSuccessSymbol, isSelfSuccess && isMergedFieldSuccess);
  result = result.set(errorsSymbol, isSelfSuccess ? Set([]) : merge(errors1, errors2));

  return result;
})

function mergerReplace(value1, value2, key) {
  return key === isSuccessSymbol ? value2 : key === errorsSymbol ? value2 : mergeWith(mergerReplace, value1, value2);
}

function replace(validation1, validation2) {
  return mergeWith(mergerReplace, validation1, validation2);
}

//field:: string -> validation -> validation
const field = curry(function field(key, validation) {
  return make(_isSuccess(validation), { [key]: validation }, []);
});

function fields(validationObj) {
  Object.entries(validationObj).reduce(([k1, v1], [k2, v2]) => all(field(k1, v1), field(k2, v2)), Success());
}

function getInner(validation, searchKeyPath) {
  return validation.getIn(searchKeyPath) || Success();
}

function _isEmpty(errors) { 
  return !errors || !Set.isSet(errors) || errors.isEmpty();
}

function _isSuccess(validation) {
  return validation.get(isSuccessSymbol);
}

function _getErrors(validation) {
  return validation.get(errorsSymbol) || Set([]);
}

export const Validation = { Success, Failure, match, all, any, replace, field, fields, getInner, _isSuccess, _getErrors };
