export type SpecName = "npm" | "commonjs_1.0" | "commonjs_1.1";

export type SpecType = "array" | "boolean" | "object" | "string";

type BaseFieldSpec = {
	format?: RegExp;
	or?: string;
	recommended?: boolean;
	required?: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validate?: (name: string, obj: any) => string[];
	warning?: boolean;
};

type FieldSpecWithType = {
	type?: SpecType;
	types?: never;
} & BaseFieldSpec;

type FieldSpecWithTypes = {
	types?: SpecType[];
	type?: never;
} & BaseFieldSpec;

export type FieldSpec = FieldSpecWithType | FieldSpecWithTypes;

export type SpecMap = {
	[key: string]: FieldSpec;
};

export type Person = {
	name: string;
	email?: string;
	url?: string;
	web?: string;
};
export type People = Person | Person[] | string;

export type UrlType = {
	type: string;
	url: string;
};

export type UrlOrMailTo =
	| string
	| { url: string; email: string; mail?: never; web?: never }
	| { mail: string; web: string; email?: never; url?: never };
