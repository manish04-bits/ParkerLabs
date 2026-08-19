function searchGames() {

    const search =
        document.getElementById("search")
        .value
        .toLowerCase();

    const cards =
        document.querySelectorAll(".game-card");

    cards.forEach(card => {

        const name =
            card.querySelector("h3")
            .textContent
            .toLowerCase();

        if (name.includes(search)) {

            card.style.display = "block";

        } else {

            card.style.display = "none";

        }

    });

}
