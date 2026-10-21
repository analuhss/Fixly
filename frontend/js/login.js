function logar () {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (senha == "AABL" && email == "aabl@gmail.com") {
        alert('Login de administrador')
        location.href = "../profissionais/home.html"
    } else {
        alert('Usuário não encontrado')
    }
}