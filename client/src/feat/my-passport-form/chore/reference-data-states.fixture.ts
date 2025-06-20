import { randState } from "@ngneat/falso";

export const fixture = [...new Set(randState({ length: 150 }))];
