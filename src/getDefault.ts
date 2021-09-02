export function getDefault<T extends {}>(value: T): 'default' extends keyof T ? T['default'] : T {
	"use strict";
	return (value as any).default ?? value;
}
