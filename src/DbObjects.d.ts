
interface User {
    _id ?: any
    username: string
    password: string
}

interface Recipe {
    _id?: any
    genesis?: any
    authorId?: any
    previous?: number
    created?: number
    name: string
    commitMsg:string
    items:RecipeItem[]
    steps:RecipeStep[]
}

interface RecipeItem {
    name: string
    quantity?: string
    unit ?: string
    type : "ingredient" | "equipment"
    comments: RecipeComent[]
}

interface RecipeStep{
    description: string
    time?: number
    tags: string[]
    comments: RecipeComent[]
}

interface RecipeComent{
    text: string
    createdAt: number
}
