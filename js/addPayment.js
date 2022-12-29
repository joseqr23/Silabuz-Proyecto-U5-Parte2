/* Local */
//const urlPayments = 'http://127.0.0.1:8000/v2/payment-users/'
//const urlServices = 'http://127.0.0.1:8000/v2/services/'
//const urlUsers = 'http://127.0.0.1:8000/users/'

/* Railway */
const urlPayments = 'https://finalunidad5-production.up.railway.app/v2/payment-users/'
const urlServices = 'https://finalunidad5-production.up.railway.app/v2/services/'
const urlUsers = 'https://finalunidad5-production.up.railway.app/users/'

const form = document.querySelector("form");
const inputs = document.querySelectorAll("input");
let selectIdUser = document.querySelector("#id-user");
let selectIdService = document.querySelector("#id-service");

const userDiv = document.querySelector("#user-data"); // user name
const pageService = document.querySelector(".head1"); // admin view

const imgDiv = document.querySelector("#img-url"); // img view

/*--------------------------- LocalStorage ----------------------------*/
// Obteniendo Token
let obtenerToken = JSON.parse(localStorage.getItem("tokens")) ?? [];
let lastToken = obtenerToken[obtenerToken.length - 1];
//console.log("Último token",lastToken);

// Obteniendo Usuario
let obtenerUser = JSON.parse(localStorage.getItem("user")) ?? [];
let lastUser = obtenerUser[obtenerUser.length - 1];
//console.log("Último User",lastUser);

// Obteniendo la url de la imagen
let obtenerImg = JSON.parse(localStorage.getItem("img")) ?? [];
let lastImg = obtenerImg[obtenerImg.length -1];
/*--------------------------- Fin LocalStorage ----------------------------*/

/*-----Almacenar Datos User-----*/
let userGetData = {} // datos a mostrar
let getUserOrAdmin = {}
async function getUsersData(){
    const response = await fetch(urlUsers);
    const data = await response.json();
    data.forEach((users)=>{
        let id = users.id
        let name = users.username
        let staff = users.is_staff
        userGetData[id]= name 
        getUserOrAdmin[id] = staff
    })

    // Admin Validator
    if (getUserOrAdmin[lastUser]){
        pageService.innerHTML += `
        <a href="./addService.html" class="navbar-brand m-1 text-black" style="padding: 15px;">Servicios</a>
        `
    }
    if (lastImg !== "") {
        imgDiv.innerHTML = `<img src="${lastImg}" style="width: 80px; height: 80px" class="rounded-circle shadow" alt="Cinque Terre">`
    } else {
        imgDiv.innerHTML = `<img src="https://img.freepik.com/foto-gratis/disparo-gran-angular-solo-arbol-que-crece-cielo-nublado-puesta-sol-rodeada-cesped_181624-22807.jpg?w=2000" style="width: 100px; height: 80px" class="rounded-circle shadow" alt="Cinque Terre">`
    }
    userDiv.innerHTML = `<small class="text-muted"><em>${userGetData[lastUser]} </em></small>`//User Data
}
getUsersData()
/*-----Fin almacen-----*/

// * Obtener ID Servicios
async function getIdService(){
    const responseIdService = await fetch(urlServices);
    const dataIdService = await responseIdService.json();
    for (let i = 0; i < dataIdService.length; i++) {
        let option = document.createElement("option");
        option.value = dataIdService[i].id;
        option.text = dataIdService[i].name;
        selectIdService.add(option);
    }     
}
getIdService()

form.onsubmit = async function(event){
    event.preventDefault();
    const body = {
        user_id : lastUser,
        service_id : selectIdService.value,
    };
    inputs.forEach((input) => (body[input.name] = input.value));
    try{
        const response = await fetch(urlPayments, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${lastToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status === 401){  // * Redirige al login
            Swal.fire( 
                "Tu token ha vencido",
                "Registrate nuevamente",
                "error",
            ).then((result)=>{
                if(result.isConfirmed){
                    window.location.replace("/templates/login/login.html") 
                }else{
                    window.location.replace("/templates/login/login.html") 
                }
            });
            removeLocalStorage()
        }
        else if (response.ok){ // * Validaciones
            Swal.fire({
                text : "¡Pago Añadido!",
                icon : "success",
                showConfirmButton: true,
            }); 
        }else if (body.expiration_date === "dd/mm/aa" || body.amount === ""){
            Swal.fire({
                text : "¡Por favor, completa los campos!",
                icon : "warning"
            });
        }
        else{
            Swal.fire({
                title: 'Oops...',
                text: '¡Algo salio mal!',
                icon : "error"
            });
        }
    
    }catch(error){
        console.log(error)
    }

}

//! Borrar Local Storage
function removeLocalStorage(){
    localStorage.clear();
}