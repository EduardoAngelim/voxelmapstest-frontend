import { useState } from 'react'

const useModel = <T extends object>(initialState: T): [T, any, any] => {
    const [model, setModel] = useState(initialState)

    const setObjValue = (obj: T) => setModel(obj)
    const setPropValue = (prop: string, value: string | number | boolean) => setModel({...model, [prop]: value})

    return [model, setObjValue, setPropValue];
}

export default useModel