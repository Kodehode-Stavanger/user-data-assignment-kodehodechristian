document.addEventListener("DOMContentLoaded", () => {
  const [clearButton, clearValuesButton, form, list] = [
    "clearButton",
    "clearValuesButton",
    "initiativeForm",
    "initiativeList",
  ].map((id) => document.getElementById(id));
  let initiatives = JSON.parse(localStorage.getItem("initiatives")) || []; // Load or initialize

  const saveInitiatives = () =>
    localStorage.setItem("initiatives", JSON.stringify(initiatives));

  const renderInitiatives = () => {
    list.innerHTML = initiatives
      .map(
        (initiative, index) => `
      <li>
        <span>${initiative.name}: </span> 
        <form id="updateForm-${index}" style="display: inline;">
          <input type="number" value="${initiative.value}" placeholder="Initiative" required>
          <button type="submit">Update</button>
        </form>
      </li>
    `
      )
      .join("");

    initiatives.forEach(
      (_, index) =>
        (document.getElementById(`updateForm-${index}`).onsubmit = (e) => {
          e.preventDefault();
          initiatives[index].value = parseInt(
            e.target.querySelector("input").value,
            10
          );
          initiatives.sort((a, b) => b.value - a.value);
          saveInitiatives();
          renderInitiatives();
        })
    );
  };

  form.onsubmit = (e) => {
    e.preventDefault();
    const { value: name } = document.getElementById("characterName");
    const { value } = document.getElementById("initiativeValue");
    initiatives.push({ name, value: parseInt(value, 10) });
    initiatives.sort((a, b) => b.value - a.value);
    saveInitiatives();
    renderInitiatives();
    document.getElementById("characterName").value = "";
    document.getElementById("initiativeValue").value = "";
  };

  [clearValuesButton, clearButton].forEach(
    (button, i) =>
      (button.onclick = () => {
        initiatives = i
          ? []
          : initiatives.map(({ name }) => ({ name, value: "" }));
        saveInitiatives();
        renderInitiatives();
      })
  );



  renderInitiatives();
});
