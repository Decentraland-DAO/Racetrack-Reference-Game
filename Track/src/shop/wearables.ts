import Wearable from "../utils/interfaces/wearable"

let wearables = {
    helmet: {
        name: "Helmet",
        rarity: "Common",
        id: "Helmet",
        price: 300,
        image_path: "models/wearables/helmet.glb",
        numericalId: 1,
        active: true,
        collection: "store",
        stock: 0,
        posy: 0.9
    },
    upperBody: {
        name: "Upper Body",
        rarity: "Common",
        id: "Upper Body",
        price: 200,
        image_path: "models/wearables/jacket.glb",
        numericalId: 2,
        active: true,
        collection: "store",
        stock: 0,
        posy: 1
    },
    lowerBody: {
        name: "Lower Body",
        rarity: "Common",
        id: "Lower Body",
        price: 250,
        image_path: "models/wearables/pants.glb",
        numericalId: 3,
        active: true,
        collection: "store",
        stock: 0,
        posy: 1.6
    },
    gloves: {
        name: "Gloves",
        rarity: "Common",
        id: "Gloves",
        price: 200,
        image_path: "models/wearables/gloves.glb",
        numericalId: 4,
        active: true,
        collection: "store",
        stock: 0,
        posy: 0.9
    },
    boots: {
        name: "Boots",
        rarity: "Common",
        id: "Boots",
        price: 250,
        image_path: "models/wearables/boots.glb",
        numericalId: 5,
        active: true,
        collection: "store",
        stock: 0,
        posy: 2
    }
}


export const wearable_boxes = {
    helmet: { position: { x: 90, y: 1  , z: -6 }, rotation: { x: 0, y: 0, z: 0 }, scale: 1.5 },
    upperBody: { position: { x: 90, y: 1, z: -9 }, rotation: { x: 0, y: 0, z: 0 }, scale: 1.5 },
    lowerBody: { position: { x: 85, y: 1, z: -6 }, rotation: { x: 0, y: 0, z: 0 }, scale: 2 },
    gloves: { position: { x: 80, y: 1, z: -6 }, rotation: { x: 0, y: 0, z: 0 }, scale: 2 },
    boots: { position: { x: 80, y: 1, z: -9 }, rotation: { x: 0, y: 0, z: 0 }, scale: 2.5 }
}

export function setWearableData(
    id: "helmet" | "upperBody" | "lowerBody" | "gloves" | "boots",
    data: Wearable
) {
    wearables[id] = data
}

export function getWearableData(
    id: "helmet" | "upperBody" | "lowerBody" | "gloves" | "boots",
) {
    return wearables[id]
}