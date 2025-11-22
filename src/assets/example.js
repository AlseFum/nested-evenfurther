export default
    {
        n1: {
            title: "N1",
            slot: ["n1", "n2"]
        },
        n2: {
            title: "n2",
            slot: {
                seq: [
                    "n1", null, {
                        repeat: 2,
                        value: {
                            title: "2"
                        }
                    },
                    {
                        continue() {
                            return Math.random() > 0.5;
                        },
                        value: {
                            title: {
                                type: "seq",
                                items: ["It's ",
                                    {
                                        type: "option",
                                        items: ["genson", "Genson"]
                                    },
                                    " Generated"
                                ]
                            }
                        }
                    }

                ]
            }
        }
    }