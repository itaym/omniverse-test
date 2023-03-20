import Conditional from '../Conditional'
import ErrorElement from '../ErrorElement'
import NOTIFICATION from './NOTIFICATION'
import styles from './NotificationsManager.module.scss'
import { useSelector } from 'react-redux'

const NotificationsManager = () => {
    const errors = useSelector(({ errors }) => errors || [])
    const array = [...errors].sort((a, b) => a.time - b.time)

    return (
        <div className={styles.notificationsManager}>
            {array.map((element) =>
                <div key={element['_id']}>
                    <Conditional condition={element.type === NOTIFICATION.TYPE_ERROR}>
                        <ErrorElement error={element} />
                    </Conditional>
                </div>)}
        </div>
    )
}

export default NotificationsManager