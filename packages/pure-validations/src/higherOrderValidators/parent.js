import { contramap } from "@totalsoft/zion";
import { checkValidators } from "./_utils";

export default function parent(validator) {
  checkValidators(validator);
  return validator |> contramap((_, ctx) => [ctx.parentModel, ctx.parentContext]);
}
