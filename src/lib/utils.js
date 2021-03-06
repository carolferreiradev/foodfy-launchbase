module.exports = {
  date(timestamp){
    const date = new Date(timestamp)

    const year = date.getUTCFullYear()

    const month = `0${date.getUTCMonth() + 1}`.slice(-2)

    const day = `0${date.getUTCDate()}`.slice(-2)

    const hour = date.getHours();

    const minutes = date.getMinutes()

    const seconds = date.getSeconds()

    return{
      iso: `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`,
      format: `${day}/${month}/${year}`
    }
  }
}