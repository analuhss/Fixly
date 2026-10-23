const formulario = document.getElementById('form-login');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const resposta = await fetch('/api/login', {
            
        })
    }
})