const edomProps = {
  edomv: "Value",
  edomvd: "Definition",
  edomvds: "Definition Source"
};

const rdomProps = {
  rdommin: "Minimum",
  rdommax: "Maximum",
  attrunit: "Units of Measure",
  attrmres: "Measurement Resolution"
};

const codesetd = {
  codesetn: "Name",
  codesets: "Source"
}

export function formatElementAsTable(
  rootElement: Element,
  columns?: { [key: string]: string }
) {
  if (!columns) {
    if (rootElement.nodeName === "attrdomv") {
      columns = {
        edomv: "Value",
        edomvd: "Definition",
        edomvds: "Definition Source"
      };
    } else {
      throw Error(`Cannot autodetect columns for ${rootElement.nodeName}`);
    }
  }

  const table = document.createElement("table");
  const head = table.createTHead();
  const tbody = table.createTBody();
  let row = document.createElement("tr");
  head.appendChild(row);
  const colElementNames = new Array<string>();
  for (const colName in columns) {
    if (columns.hasOwnProperty(colName)) {
      const colText = columns[colName];
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = colText;
      row.appendChild(th);
      colElementNames.push(colName);
    }
  }

  if (rootElement.hasChildNodes()) {
    for (const domain of Array.from(rootElement.childNodes)) {
      row = table.insertRow(-1);
      const cellNodes = Array.from(domain.childNodes);
      for (const name of colElementNames) {
        const cell = row.insertCell(-1);
        const node = cellNodes.find(n => n.nodeName === name);
        if (node) {
          cell.textContent = node.textContent;
        }
      }
    }
  }

  return table;
}
