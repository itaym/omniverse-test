import * as actions from '../actions/root'
import { ActionReducerMapBuilder, createReducer, Reducer } from '@reduxjs/toolkit'
import { RootState, rootAction } from '../../types'
import { isFulfilledAction, isPendingAction, isRejectedAction } from '../checkers'

const initialState: RootState = {
    isLoading: false,
    errors: [],
}

const root:Reducer = createReducer(initialState, (builder:ActionReducerMapBuilder<RootState>) => {
    // @ts-ignore
    builder
        .addCase(actions.clearAllErrors.fulfilled, (state:RootState, action:rootAction) => {
            state.errors = action.payload
        })
        .addCase(actions.clearError.fulfilled, (state:RootState, action:rootAction) => {
            state.errors = action.payload
        })
        .addMatcher(isPendingAction, (state:RootState) => {
            state.isLoading = true
        })
        .addMatcher(isFulfilledAction, (state:RootState) => {
            state.isLoading = false
        })
        .addMatcher(isRejectedAction, (state:RootState, action:rootAction) => {
            if (action.payload) {
                state.errors.push(action.payload)
            }
            state.isLoading = false
        })
})

export default root