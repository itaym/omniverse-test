import TIME_UNITS from './TIME_UNITS'
import classNames from 'classnames'
import sleep from './sleep'
import styles from './ErrorElement.module.scss'
import { clearError } from '../../redux/actions/root'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

const ErrorElement = (({ error, timeout = 60_000 }) => {

    const [countDown, setCountDown] = useState(timeout / 1000)
    const [minimize, setMinimize] = useState(false)
    const dispatch = useDispatch()

    const onClick = useCallback(() => setMinimize(true), [])

    useEffect(() => {
        if (countDown < 2) {
            setMinimize(true)
        }
        if (countDown > 0) {
            let time = TIME_UNITS.SECOND
            let value = 1
            if (countDown < 1) {
                time = countDown * TIME_UNITS.SECOND
                value = countDown
            }
            sleep(time).then(() => {
                setCountDown(countDown - value)
            })
        }
        else {
            dispatch(clearError(error))
        }
    }, [countDown, dispatch, error])
    return (
        <div className={classNames(styles.errorElement, { [styles.minimize]: minimize})}>
            <div className={styles.text}>{error.message}</div>
            <div className={styles.time}>{Math.floor(countDown)}s</div>
            <div className={styles.x} onClick={onClick}>X</div>
        </div>
    )
})

export default ErrorElement