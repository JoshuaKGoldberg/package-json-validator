export type FieldSpec = FieldSpecWithType | FieldSpecWithTypes;

export type People = Person | Person[] | string;

export interface Person {
	email?: string;
	name: string;
	url?: string;
	web?: string;
}

export type SpecMap = Record<string, FieldSpec>;

export type SpecName = "commonjs_1.0" | "commonjs_1.1" | "npm";

export type SpecType = "array" | "boolean" | "object" | "string";

export type UrlOrMailTo =
	| string
	| { email: string; mail?: never; url?: string; web?: never }
	| { email?: never; mail: string; url?: never; web?: string }
	| { email?: never; mail?: string; url?: never; web: string }
	| { email?: string; mail?: never; url: string; web?: never };

export interface UrlType {
	type: string;
	url: string;
}
interface BaseFieldSpec {
	format?: RegExp;
	or?: string;
	recommended?: boolean;
	required?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validate?: (name: string, obj: any) => string[];
	warning?: boolean;
}

type FieldSpecWithType = BaseFieldSpec & {
	type?: SpecType;
	types?: never;
};

type FieldSpecWithTypes = BaseFieldSpec & {
	type?: never;
	types?: SpecType[];
};
