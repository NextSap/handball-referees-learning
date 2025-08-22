export function color(score: number, maxScore: number) {
    const percentage = (score / maxScore * 100);
    if (percentage < 55) return <span className="text-red-700">{percentage.toPrecision(3)}%</span>;
    if (percentage < 70) return <span className="text-orange-600">{percentage.toPrecision(3)}%</span>;
    if (percentage < 85) return <span className="text-yellow-500">{percentage.toPrecision(3)}%</span>;
    return <span className="text-green-700">{percentage.toPrecision(3)}%</span>;
}

export function format(array: any[]) {
    if (!array) return <></>;
    return array.map((value, index) => {
        return (
            <span key={index}>{value} </span>
        )
    })
}