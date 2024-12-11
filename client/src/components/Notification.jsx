import PropTypes from 'prop-types'
import '../index.css'

const Notification = ({ message, className }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={className}>
      {message}
    </div>
  )
}

Notification.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
}

Notification.displayName = 'Notification'

export default Notification