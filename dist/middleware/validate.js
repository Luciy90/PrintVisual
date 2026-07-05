export function validate(target, schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req[target]);
        if (!result.success) {
            next(result.error);
            return;
        }
        req[target] = result.data;
        next();
    };
}
