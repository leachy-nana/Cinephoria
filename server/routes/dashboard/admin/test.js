<!DOCTYPE html>
<html lang="en" class="h-full scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= title %></title>
    <link rel="icon" href="/images/logo-blanc.png" type="image/x-icon">
    <link type="text/css" rel="stylesheet" href="/css/output.css" />
    <link rel="stylesheet" href="/css/style.css">
    <script src="https://kit.fontawesome.com/1126a5f03b.js" crossorigin="anonymous"></script>
    <script defer src="/js/room.js"></script>
    <script type="text/javascript" defer src="../js/activeLink.js"></script>
</head>
<body class="min-h-screen relative">
<!-- Nav Bar -->
<header class="relative z-10 ">
    <%- include('../../../components/dashboard/nav-bar-dashboard') %>
</header>

<!-- Cinema and Date Filters -->
<main class="flex text-blueOne w-full flex-col items-center gap-y-7 justify-center md:w-[85vw] ml-auto md:pt-40" id="main-container">
    <section class="container w-full md:w-[85vw] ml-auto flex flex-col mt-10 relative">
        <form id="addRoomForm" action="/api/v1/" method="post" class="flex flex-col items-center justify-center relative bg-whiteOne w-[90%] md:w-[55%] mx-auto rounded-sm px-6 py-5 space-y-5 md:py-7 md:space-y-8">
            <div class="absolute top-5">
                <ul id="error-messages" class="text-redOne font-arvo font-bold"></ul>
            </div>

            <h1 class="text-blueOne font-arvo text-3xl tracking-wide font-bold text-center">AJOUTER</h1>

            <div class="relative w-full">
                <div class="w-full h-16 bg-white flex items-center justify-between px-7 cursor-pointer" id="select-theater">
                    <p class="font-arvo text-lg font-bold text-blueOne" id="cinema-choosen">Choisir un cinema</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
                        <path fill="currentColor" d="M4.516 7.548c.436-.446 1.043-.481 1.576 0L10 11.295l3.908-3.747c.533-.481 1.141-.446 1.574 0c.436.445.408 1.197 0 1.615c-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S4.924 9.581 4.516 9.163c-.409-.418-.436-1.17 0-1.615"/>
                    </svg>
                </div>

                <!-- hidden theater menu -->
                <div class="absolute bg-blueOne w-full h-fit py-8 px-2 left-0 -bottom-96 z-50 animate-open-menu hidden" id="theater-menu">
                    <% if (cinemas.length !== 0) { %>
                        <ul class="w-full space-y-5 font-arvo font-bold text-white text-lg" id="theater-list">
                            <% cinemas.forEach(cinema => { %>
                                <li class="list-none hover:translate-x-5 duration-200 ease-out cursor-pointer hover:text-goldOne hover:scale-105" data-cinema-id="<%= cinema.cinema_id %>"><%= cinema.name %></li>
                            <% }) %>
                        </ul>
                    <% } else { %>
                        <p class="text-center font-arvo text-white font-bold text-3xl w-fit ">Aucun cinema</p>
                    <% } %>
                </div>
            </div>

            <!-- Informations de la salle -->
            <section id="main-field" class="flex flex-col w-full gap-y-6 ">
               
                <div class="container relative">
                    <div class="w-full h-16 bg-white flex items-center justify-between px-7  cursor-pointer" id="select-room">
                        <p class="font-arvo text-lg font-bold text-blueOne" id="room-choosen">Choisir une salle</p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 20">
                            <path fill="currentColor" d="M4.516 7.548c.436-.446 1.043-.481 1.576 0L10 11.295l3.908-3.747c.533-.481 1.141-.446 1.574 0c.436.445.408 1.197 0 1.615c-.406.418-4.695 4.502-4.695 4.502a1.095 1.095 0 0 1-1.576 0S4.924 9.581 4.516 9.163c-.409-.418-.436-1.17 0-1.615"/>
                        </svg>
                    </div>
                    <!-- hidden theater menu -->
                    <div class="absolute bg-blueOne w-full h-fit py-8 px-2 left-0 -bottom-16 hidden  z-50 animate-open-menu " id="room-menu">
                        <% if (rooms.length > 0) { %>
                            <ul class="w-full space-y-5 font-arvo font-bold text-white text-lg" id="room-list">
                                <% rooms.forEach(room => { %>
                                    <li class="list-none hover:translate-x-5 duration-200 ease-out cursor-pointer hover:text-goldOne hover:scale-105" data-room-id="<%= room.room_id %>" data-room-name="<%= room.name %>"><%= room.name %></li>
                                <% }) %>
                            </ul>
                        <% } else { %>
                            <p class="text-center font-arvo text-white font-bold text-3xl w-fit ">Aucune Salle</p>
                        <% } %>
                    </div>
                </div>
            </section>

            <input type="hidden" id="cinema-id" name="cinema-id">
            <input type="hidden" id="room-id" name="room-id">
            <input type="hidden" id="current-room-name" name="current-room-name">

            <button type="button" id="open-alert-btn" class="mx-auto bg-redOne font-arvo text-white font-bold text-lg px-10 py-2 mt-2 flex hover:scale-95 duration-200 ease-in-out items-center justifify-center">Supprimer</button>

            <!-- hidden alert pop up -->
            <div class="absolute z-50 animate-open-menu hidden flex-col items-center justify-around bg-blueOne/75 w-[50vw] h-[100vh] rounded-lg px-10 py-48" id="alert">
                <p id="alert-message" class="text-center font-arvo text-white font-bold text-3xl">VOULEZ-VOUS VRAIMENT SUPPRIMER LA SALLE ?</p>
                <div class="flex items-center justify-center space-x-10">
                    <button type="button" id="submit-form" class="bg-green-500 w-36 h-14 text-white font-arvo font-bold flex items-center justify-center hover:scale-95 duration-200 hover:bg-green-400">
                        OUI
                    </button>
                    <button type="button" id="close-alert" class="bg-redOne w-36 h-14 text-white font-arvo font-bold flex items-center justify-center hover:scale-95 duration-200 hover:bg-red-500">
                        NON
                    </button>
                </div>
            </div>

        </form>

    </section>

</main>

<!-- Side Bar Menu -->
<aside class="fixed z-20 top-0 left-0 h-screen">
    <%- include('../../../components/dashboard/side-menu') %>
</aside>

<!-- Footer -->
<footer class="pt-[400px]">
    <%- include('../../../components/footer') %>
</footer>

</body>
</html>