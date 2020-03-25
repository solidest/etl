function findParent(parent, children, id) {
    for (let it of children) {
        if (it.id === id) {
            return parent;
        }
        if(!it.children) {
            continue;
        }
        let p = findParent(it, it.children, id);
        if(p) {
            return p;
        }
    }
}
