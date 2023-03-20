import { rootAction, todoAction } from '../../types'

type CheckerFunction = (action:rootAction | todoAction) => boolean

const createChecker = (endsWith:string):CheckerFunction => function(action:rootAction | todoAction): boolean {
    return action.type.endsWith(endsWith)
}

export const isFulfilledAction = createChecker('/fulfilled')
export const isPendingAction = createChecker('/pending')
export const isRejectedAction = createChecker('/rejected')


