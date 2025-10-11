export type People = Person | Person[] | string;

export interface Person {
	email?: string;
	name: string;
	url?: string;
	web?: string;
}

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
