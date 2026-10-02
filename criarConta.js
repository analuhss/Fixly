document.getElementById("formCriarConta").addEventListener("submit", (e) => {
    e.preventDefault()

    let email = document.getElementById("email").value
    let senha = document.getElementById("password").value

    let erros = []
    if (senha.length < 8) erros.push("pelo menos 8 caracteres")
    if (!/[a-z]/.test(senha)) erros.push("uma letra minúscula")
    if (!/[A-Z]/.test(senha)) erros.push("uma letra maiúscula")
    if (!/\d/.test(senha)) erros.push("um número")
    if (!/[^A-Za-z0-9]/.test(senha)) erros.push("um caractere especial")

    if (erros.length > 0) {
        alert("Sua senha precisa ter: " + erros.join(", "))
        return
    }

    sessionStorage.setItem("emailCadastro", email)

    window.location.href = "./informacoes.html"
})