import { randState } from "@ngneat/falso";

export default [...new Set(randState({ length: 150 }))];
