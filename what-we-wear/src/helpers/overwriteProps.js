let overwriteProps = (proto, object) => {
    Object.entries(object).map(entry => {
        return proto[entry[0]] = entry[1];
    })
    return proto;
}

export default overwriteProps;