const generateImageName = (id: string) => {
    return Date.now() + '-' + id;
};

export default generateImageName;
