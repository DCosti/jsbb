import get from 'lodash.get';

export function create(isDirty = false) {
    return { isDirty };
}

export function update(propertyPath, propertyDirtyInfo, dirtyInfo) {
    const indexOfDot = propertyPath.indexOf(".");
    if (indexOfDot === -1) {
        return updateSingleProperty(propertyPath, propertyDirtyInfo, dirtyInfo);
    }
    else {
        const leftProp = propertyPath.slice(0, indexOfDot);
        const rightProp = propertyPath.slice(indexOfDot + 1);
        return updateSingleProperty(leftProp, update(rightProp, propertyDirtyInfo, dirtyInfo[leftProp] || create()), dirtyInfo);
    }
}

export function merge(sourceDirtyInfo, targetDirtyInfo) {
    if (sourceDirtyInfo === targetDirtyInfo || sourceDirtyInfo === null || sourceDirtyInfo === undefined) {
        return targetDirtyInfo;
    }

    if (targetDirtyInfo === null || targetDirtyInfo === undefined) {
        return sourceDirtyInfo;
    }

    if (typeof sourceDirtyInfo === "boolean") {
        return sourceDirtyInfo;
    }

    const result = Object.keys(sourceDirtyInfo)
        .filter(x => x !== "isDirty")
        .reduce(
            (accumulator, property) => updateSingleProperty(property, merge(sourceDirtyInfo[property], targetDirtyInfo[property]), accumulator),
            targetDirtyInfo
        );
    return result;
}

export function isPropertyDirty(propertyPath, dirtyInfo) {
    return getIsDirty(get(dirtyInfo, propertyPath));
}

function updateSingleProperty(property, propertyDirtyInfo, dirtyInfo) {
    if (dirtyInfo[property] === propertyDirtyInfo) {
        return dirtyInfo;
    }

    let result = {
        ...dirtyInfo,
        [property]: propertyDirtyInfo,
    };

    const isDirtyChanged = getIsDirty(dirtyInfo[property]) !== getIsDirty(propertyDirtyInfo);
    return isDirtyChanged
        ? {
            ...result,
            isDirty: reduceIsDirty(result)
        }
        : result;
}

function reduceIsDirty(dirtyInfo) {
    const isDirty = Object.keys(dirtyInfo).filter(x => x !== "isDirty").some(x => getIsDirty(dirtyInfo[x]));
    return isDirty;
}

function getIsDirty(dirtyInfo) {
    return typeof dirtyInfo === "boolean"
        ? dirtyInfo
        : dirtyInfo && dirtyInfo.isDirty;
}