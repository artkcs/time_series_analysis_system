export const integrationSuccessfullyAddedMsg = () => {
    return commonSuccessMsg("Integracija sėkmingai pridėta!")
}

export const integrationSuccessfullyDeletedMsg = () => {
    return commonErrorMsg("Integracija sėkmingai pašalinta!")
}

export const integrationAlreadyExistsMsg = () => {
    return commonErrorMsg("Integracija su tokiu pavadinimu jau registruota!")
}

const commonSuccessMsg = (msg) => {
    var msgBlock        = document.createElement("div")
    msgBlock.classList  = "add-new-form__msg-block msg-block"
    msgBlock.id         = "msg"

    var img     = document.createElement("img")
    img.src     = '/frontend/static/images/check.svg'
    img.width   = "60"
    img.height  = "60"
    msgBlock.append(img)

    var p           = document.createElement("p")
    p.innerText     = msg
    msgBlock.append(p)

    return msgBlock
}

export const commonErrorMsg = (msg) => {
    var msgBlock        = document.createElement("div")
    msgBlock.classList  = "add-new-form__msg-block msg-block"
    msgBlock.id         = "msg"

    var img     = document.createElement("img")
    img.src     = '/frontend/static/images/error.svg'
    img.width   = "60"
    img.height  = "60"
    msgBlock.append(img)

    var p           = document.createElement("p")
    p.innerText     = msg
    msgBlock.append(p)

    return msgBlock
}