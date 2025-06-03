const generateSlug = async (name: string) => {
    const id =
        name.toLocaleLowerCase().split(' ').join('-') +
        Math.round(Math.random() * 10000);
    return id;
};

export default generateSlug;
